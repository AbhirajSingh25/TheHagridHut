import {

  Mic,

  MicOff,

  Play,

  Square,

  Video,

} from "lucide-react";

type Props={

  started:boolean;

  recording:boolean;

  loading:boolean;

  onStart:()=>void;

  onRecord:()=>void;

  onStop:()=>void;

};

export default function InterviewControls({

started,

recording,

loading,

onStart,

onRecord,

onStop,

}:Props){

return(

<div
className="
flex
items-center
justify-center
gap-5
"
>

<button

onClick={

started

?

recording

?

onStop

:

onRecord

:

onStart

}

disabled={loading}

className="
w-20
h-20
rounded-full
bg-red-500
hover:bg-red-400
transition-all
flex
items-center
justify-center
"

>

{

!started

?

<Play size={32}/>

:

recording

?

<Square size={28}/>

:

<Mic size={28}/>

}

</button>

<button
className="
w-14
h-14
rounded-full
bg-cyan-500
flex
items-center
justify-center
"
>

<Video/>

</button>

<button
className="
w-14
h-14
rounded-full
bg-white/5
border
border-white/10
flex
items-center
justify-center
"
>

<MicOff/>

</button>

</div>

);

}