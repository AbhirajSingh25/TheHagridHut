type Props = {

  current:number;

  total:number;

};

export default function InterviewProgress({

current,

total,

}:Props){

const percentage=(current/total)*100;

return(

<div
className="
w-full
max-w-5xl
mx-auto
"
>

<div
className="
flex
justify-between
mb-3
text-zinc-400
text-sm
"
>

<span>

Interview Progress

</span>

<span>

{current}/{total}

</span>

</div>

<div
className="
w-full
h-3
rounded-full
bg-white/5
overflow-hidden
"
>

<div

style={{
width:`${percentage}%`
}}

className="
h-full
bg-gradient-to-r
from-red-500
to-red-300
duration-500
transition-all
"
/>

</div>

</div>

);

}