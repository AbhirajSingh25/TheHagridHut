type Props={

evaluation:any;

};

export default function RecruiterInsights({

evaluation,

}:Props){

if(!evaluation){

return(

<div
className="
rounded-3xl
border
border-white/10
bg-[#090909]
p-6
"
>

<h2
className="
text-2xl
font-black
mb-4
"
>

Recruiter AI

</h2>

<p
className="
text-zinc-500
"
>

Waiting for evaluation...

</p>

</div>

);

}

return(

<div
className="
rounded-3xl
border
border-white/10
bg-[#090909]
p-6
space-y-4
"
>

<h2
className="
text-2xl
font-black
"
>

Recruiter AI

</h2>

<div>

Technical

<b className="float-right">

{evaluation.technical}

%

</b>

</div>

<div>

Communication

<b className="float-right">

{evaluation.communication}

%

</b>

</div>

<div>

Confidence

<b className="float-right">

{evaluation.confidence}

%

</b>

</div>

<div>

Overall

<b className="float-right text-red-400">

{evaluation.overall_score}

%

</b>

</div>

</div>

);

}