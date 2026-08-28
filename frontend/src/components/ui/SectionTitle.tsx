interface Props {

children:string;

}


export default function SectionTitle({
children
}:Props){

return (

<h2
className="
text-xl
font-semibold
text-white
mb-5
"
>

{children}

</h2>

);

}