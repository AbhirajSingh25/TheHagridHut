type Props={

status:string;

};

export default function SessionStatus({

status,

}:Props){

const color=

status==="Listening"

?

"text-green-400"

:

status==="Thinking"

?

"text-yellow-400"

:

status==="Speaking"

?

"text-cyan-400"

:

"text-red-400";

return(

<div
className="
flex
items-center
gap-3
"
>

<div
className={`
w-3
h-3
rounded-full
animate-pulse
bg-current
${color}
`}
/>

<p
className={`
font-semibold
${color}
`}
>

{status}

</p>

</div>

);

}