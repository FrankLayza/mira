/**
 * evaluate_classifier.mjs  –  run: node evaluate_classifier.mjs
 * Must be run from mira-app/ so node_modules and .env.local are available.
 */
import { HfInference } from "@huggingface/inference";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envLines = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n");
for (const line of envLines) {
  const eq = line.indexOf("=");
  if (eq > 0) process.env[line.slice(0,eq).trim()] = line.slice(eq+1).trim();
}

const hf = new HfInference(process.env.HF_TOKEN);

const LABEL_MAP = {
  neutral:"Normal",approval:"Normal",admiration:"Normal",amusement:"Normal",
  joy:"Normal",love:"Normal",optimism:"Normal",pride:"Normal",relief:"Normal",
  gratitude:"Normal",excitement:"Normal",curiosity:"Normal",surprise:"Normal",
  realization:"Normal",desire:"Normal",
  nervousness:"Anxiety",fear:"Anxiety",
  sadness:"Depression",grief:"Depression",disappointment:"Depression",remorse:"Depression",
  annoyance:"Stress",anger:"Stress",frustration:"Stress",caring:"Stress",
  confusion:"Bipolar",
  embarrassment:"Personality Disorder",disapproval:"Personality Disorder",disgust:"Personality Disorder",
};

const SUICIDAL_KEYWORDS=[
  "kill myself","suicide","end my life","want to die","ending my life",
  "self harm","self-harm","commit suicide","take my own life","wanna die",
  "better off dead","dont want to live","don't want to live","end it all",
  "harm myself","cutting myself","suicidal",
];

const CATEGORIES=["Normal","Anxiety","Depression","Stress","Suicidal","Bipolar","Personality Disorder"];

const TEST_SET=[
  ["I had a really good day today. Spent time with friends and felt great.","Normal"],
  ["Just finished my assignment and feeling proud of what I submitted.","Normal"],
  ["I am happy to be alive and grateful for my family.","Normal"],
  ["Today was fine. Nothing special happened but I feel okay.","Normal"],
  ["I love this course and I am excited about the semester ahead.","Normal"],
  ["My roommates and I watched a movie last night and had a good laugh.","Normal"],
  ["I feel calm and ready to face whatever comes today.","Normal"],
  ["Things are going well. I am managing my time better now.","Normal"],
  ["I got a good grade on my test and I am really pleased.","Normal"],
  ["I just want to talk. I am doing alright overall.","Normal"],
  ["Life is okay right now. I feel balanced and settled.","Normal"],
  ["I am feeling curious about the new topics we are covering in class.","Normal"],
  ["Relieved that the exams are finally over. I feel free.","Normal"],
  ["I am enjoying the break and spending time on things I love.","Normal"],
  ["I feel content. No major issues today.","Normal"],
  ["I keep worrying about my exams and I cannot sleep at night.","Anxiety"],
  ["My heart races whenever I think about the presentation next week.","Anxiety"],
  ["I am scared I will fail my final year project and disappoint my family.","Anxiety"],
  ["I feel nervous all the time and I do not know why.","Anxiety"],
  ["The fear of not getting a job after graduation is consuming me.","Anxiety"],
  ["I panic before every test even when I have studied.","Anxiety"],
  ["I am constantly worried that I am not doing enough.","Anxiety"],
  ["Something bad is going to happen and I cannot shake the feeling.","Anxiety"],
  ["I am afraid of what people think of me when I speak in class.","Anxiety"],
  ["Every time I submit an assignment I am terrified it is wrong.","Anxiety"],
  ["I feel on edge and my mind will not stop running.","Anxiety"],
  ["I am frightened about my results coming out next week.","Anxiety"],
  ["I worry that my friends secretly dislike me.","Anxiety"],
  ["The thought of failing makes me feel sick with fear.","Anxiety"],
  ["I cannot relax. There is always something to be anxious about.","Anxiety"],
  ["I have been feeling really low lately and nothing seems to matter anymore.","Depression"],
  ["I feel empty inside and I do not know how to describe it.","Depression"],
  ["I have lost interest in everything I used to enjoy.","Depression"],
  ["Some mornings I cannot bring myself to get out of bed.","Depression"],
  ["I feel like a burden to everyone around me.","Depression"],
  ["Nothing excites me anymore. Everything feels pointless.","Depression"],
  ["I have been crying for no particular reason and I feel embarrassed.","Depression"],
  ["I feel sad most of the time and I cannot explain it to anyone.","Depression"],
  ["I grieve over choices I have made and I cannot forgive myself.","Depression"],
  ["I feel so disappointed in myself. I have not achieved what I planned.","Depression"],
  ["I feel hopeless about my future. Nothing seems to be going right.","Depression"],
  ["I am remorseful about things that happened months ago and it still hurts.","Depression"],
  ["I have no motivation. I just go through the day feeling hollow.","Depression"],
  ["I feel disconnected from everyone around me.","Depression"],
  ["My mood has been very dark and I find it hard to talk to people.","Depression"],
  ["Everything has been overwhelming this week with assignments and deadlines.","Stress"],
  ["I am so frustrated with my group project. Nobody is contributing.","Stress"],
  ["My lecturers keep adding more work and I am at my limit.","Stress"],
  ["I am so annoyed. I have been waiting for my school fees clearance for weeks.","Stress"],
  ["I feel like I am carrying everything alone. The pressure is too much.","Stress"],
  ["I am angry at myself for procrastinating and now the deadline is tomorrow.","Stress"],
  ["There is too much on my plate and I cannot handle it anymore.","Stress"],
  ["My supervisor keeps changing the requirements and I am fuming.","Stress"],
  ["The workload this semester is unreasonable and I am burning out.","Stress"],
  ["I have three tests in one week and I am completely overwhelmed.","Stress"],
  ["I feel so irritated. Nothing is going according to plan.","Stress"],
  ["I am stressed about money. My allowance has not come and rent is due.","Stress"],
  ["I feel like I am on the verge of snapping. Everything irritates me.","Stress"],
  ["I care so much about doing well but the pressure is crushing.","Stress"],
  ["I am overwhelmed. I cannot keep up with this pace.","Stress"],
  ["I do not see the point in anything anymore. I have been thinking about hurting myself.","Suicidal"],
  ["I want to die. I cannot take this anymore.","Suicidal"],
  ["I have been thinking about suicide and I do not know who to tell.","Suicidal"],
  ["I keep having thoughts of ending my life and it scares me.","Suicidal"],
  ["I am suicidal. I feel completely alone and I see no way out.","Suicidal"],
  ["I want to kill myself. Everything is too painful.","Suicidal"],
  ["I have been cutting myself to cope and I think I need help.","Suicidal"],
  ["I do not want to live like this anymore. I think about ending it every day.","Suicidal"],
  ["I feel better off dead. Nobody would miss me.","Suicidal"],
  ["I have been self-harming. I am ashamed but I do not know how to stop.","Suicidal"],
  ["I keep thinking about taking my own life and I am terrified of myself.","Suicidal"],
  ["I wanna die. I am so tired of everything.","Suicidal"],
  ["I tried to end it all last night. I do not know why I am telling you this.","Suicidal"],
  ["I don't want to live anymore. Nothing is working out.","Suicidal"],
  ["I feel like committing suicide. I cannot see another way.","Suicidal"],
  ["One moment I feel unstoppable and the next I crash completely.","Bipolar"],
  ["My moods switch so fast. I was euphoric yesterday and I feel awful today.","Bipolar"],
  ["I am confused about how I feel. My emotions are all over the place.","Bipolar"],
  ["I have highs where I feel like I can do everything and lows where I cannot move.","Bipolar"],
  ["My energy levels are unpredictable. I never know how I will feel when I wake up.","Bipolar"],
  ["I feel confused by my own mind. Sometimes I feel great and sometimes I feel destroyed.","Bipolar"],
  ["I went from feeling on top of the world to feeling completely worthless in one day.","Bipolar"],
  ["I do not understand my own feelings. They change too fast to make sense of.","Bipolar"],
  ["My thoughts are racing and I feel confused about what I actually feel.","Bipolar"],
  ["I feel like two different people depending on the day.","Bipolar"],
  ["I spent three days barely sleeping and feeling invincible, and now I cannot get up.","Bipolar"],
  ["My mood is unstable and it is affecting my relationships and my work.","Bipolar"],
  ["I feel disoriented. My emotional state changes without any clear reason.","Bipolar"],
  ["The confusion inside my head is exhausting. I cannot predict myself anymore.","Bipolar"],
  ["I oscillate between feeling completely fine and feeling utterly broken.","Bipolar"],
  ["I feel so embarrassed by things I said in class. I cannot face anyone.","Personality Disorder"],
  ["I feel disgusted with myself and I do not know why.","Personality Disorder"],
  ["I disapprove of myself constantly. Nothing I do feels acceptable.","Personality Disorder"],
  ["I feel ashamed of who I am in a way I cannot explain to anyone.","Personality Disorder"],
  ["I always feel like I am doing something wrong socially even when I try.","Personality Disorder"],
  ["I feel intense shame after every social interaction, even normal ones.","Personality Disorder"],
  ["I feel disgust when I look in the mirror. I hate how I present myself.","Personality Disorder"],
  ["I disapprove of almost every decision I make. I cannot trust my own judgment.","Personality Disorder"],
  ["I embarrass myself constantly and replay every mistake for days.","Personality Disorder"],
  ["I feel fundamentally flawed compared to everyone around me.","Personality Disorder"],
  ["I feel deep shame about things that happened years ago and I cannot move on.","Personality Disorder"],
  ["I am disgusted by my own thoughts and I am scared to share them.","Personality Disorder"],
  ["I keep disapproving of myself and I know it is irrational but I cannot stop.","Personality Disorder"],
  ["I feel embarrassed to exist. I do not know how else to put it.","Personality Disorder"],
  ["I feel such shame around other people that I prefer to stay alone.","Personality Disorder"],
];

function checkSuicidal(text){
  const n=text.toLowerCase().replace(/['']/g,"");
  return SUICIDAL_KEYWORDS.some(kw=>n.includes(kw.replace(/['']/g,"")));
}
function mapLabel(raw){ return LABEL_MAP[raw.toLowerCase()]??"Normal"; }
async function classify(text){
  if(checkSuicidal(text)) return "Suicidal";
  try{
    const r=await hf.textClassification({model:"SamLowe/roberta-base-go_emotions",inputs:text});
    return mapLabel(r[0].label);
  }catch(e){
    console.error(`  ERR: ${e.message.slice(0,80)}`);
    return "Normal";
  }
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// ── Run ───────────────────────────────────────────────────────────────────
const div="=".repeat(62);
console.log(div);
console.log("MIRA CLASSIFIER EVALUATION");
console.log(`Model  : SamLowe/roberta-base-go_emotions`);
console.log(`Samples: ${TEST_SET.length}`);
console.log(div);

const preds=[],truth=[],details=[];
for(let i=0;i<TEST_SET.length;i++){
  const[text,tl]=TEST_SET[i];
  const pred=await classify(text);
  preds.push(pred); truth.push(tl);
  const m=pred===tl?"OK      ":"MISMATCH";
  console.log(`  [${String(i+1).padStart(3,"0")}] TRUE=${tl.padEnd(22)} PRED=${pred.padEnd(22)} ${m}`);
  details.push({id:i+1,text:text.slice(0,60),true:tl,pred,match:pred===tl});
  await sleep(400);
}

const tp={},fp={},fn={};
for(const c of CATEGORIES){tp[c]=0;fp[c]=0;fn[c]=0;}
for(let i=0;i<truth.length;i++){
  const t=truth[i],p=preds[i];
  if(t===p)tp[t]++;
  else{fp[p]=(fp[p]||0)+1;fn[t]=(fn[t]||0)+1;}
}

console.log(`\n${div}\nPER-CATEGORY RESULTS\n${div}`);
console.log(`\n${"Category".padEnd(26)}${"Prec".padStart(7)}${"Rec".padStart(7)}${"F1".padStart(7)}${"Supp".padStart(7)}`);
console.log("-".repeat(55));

const perCat={},mP=[],mR=[],mF=[];
for(const cat of CATEGORIES){
  const t=tp[cat]||0,f=fp[cat]||0,n=fn[cat]||0,supp=t+n;
  const prec=(t+f)>0?t/(t+f):0,rec=(t+n)>0?t/(t+n):0;
  const f1=(prec+rec)>0?2*prec*rec/(prec+rec):0;
  perCat[cat]={precision:+prec.toFixed(4),recall:+rec.toFixed(4),f1:+f1.toFixed(4),support:supp};
  if(supp>0){mP.push(prec);mR.push(rec);mF.push(f1);}
  console.log(`  ${cat.padEnd(24)}${prec.toFixed(4).padStart(7)}${rec.toFixed(4).padStart(7)}${f1.toFixed(4).padStart(7)}${String(supp).padStart(7)}`);
}
const correct=preds.filter((p,i)=>p===truth[i]).length;
const acc=correct/TEST_SET.length;
const mp=mP.reduce((a,b)=>a+b,0)/mP.length;
const mr=mR.reduce((a,b)=>a+b,0)/mR.length;
const mf1=mF.reduce((a,b)=>a+b,0)/mF.length;
console.log("-".repeat(55));
console.log(`  ${"Macro Average".padEnd(24)}${mp.toFixed(4).padStart(7)}${mr.toFixed(4).padStart(7)}${mf1.toFixed(4).padStart(7)}${String(TEST_SET.length).padStart(7)}`);
console.log(`\n  Overall Accuracy: ${acc.toFixed(4)}  (${correct}/${TEST_SET.length})`);

const misses=details.filter(d=>!d.match);
console.log(`\n${div}\nMISCLASSIFIED SAMPLES\n${div}`);
for(const m of misses){
  console.log(`  [${String(m.id).padStart(3,"0")}] TRUE=${m.true}, PRED=${m.pred}`);
  console.log(`       "${m.text}..."`);
}

const output={
  model:"SamLowe/roberta-base-go_emotions",
  n_samples:TEST_SET.length,
  accuracy:+acc.toFixed(4),
  macro_precision:+mp.toFixed(4),
  macro_recall:+mr.toFixed(4),
  macro_f1:+mf1.toFixed(4),
  per_category:perCat,
  misclassified:misses,
};
writeFileSync("..\\eval_results.json",JSON.stringify(output,null,2));
console.log(`\nResults saved to: ..\\eval_results.json`);
console.log(div);
