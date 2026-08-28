type Props={

transcript:string;

};

export default function LiveTranscript({

transcript,

}:Props){

return(

<div
className="
rounded-3xl
border
border-white/10
bg-[#090909]
p-6
min-h-[220px]
"
>

<h2
className="
text-2xl
font-black
mb-5
"
>

Live Transcript

</h2>

<p
className="
text-zinc-400
leading-8
"
>

{

transcript.length>0

?

transcript

:

"Waiting for speech..."

}

</p>

</div>

);

}