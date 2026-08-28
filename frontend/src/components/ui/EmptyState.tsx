// frontend/src/components/ui/EmptyState.tsx

interface Props {

  title: string;

  description: string;

  buttonText?: string;
}


function EmptyState({

  title,

  description,

  buttonText,
}: Props) {

  return (

    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        text-center
        py-24
      "
    >

      <div
        className="
          w-32
          h-32
          rounded-full
          bg-cyan-500/10
          border
          border-cyan-500/20
          flex
          items-center
          justify-center
          text-5xl
          mb-8
        "
      >
        🤖
      </div>


      <h2
        className="
          text-4xl
          font-black
          mb-4
        "
      >
        {title}
      </h2>


      <p
        className="
          text-zinc-500
          text-xl
          max-w-xl
          mb-8
        "
      >
        {description}
      </p>


      {
        buttonText && (

          <button
            className="
              px-7
              py-4
              rounded-2xl
              bg-cyan-500
              text-black
              font-bold
            "
          >
            {buttonText}
          </button>
        )
      }

    </div>
  );
}

export default EmptyState;