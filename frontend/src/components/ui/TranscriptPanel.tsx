interface Props {

  transcript: string;
}

function TranscriptPanel({

  transcript,
}: Props) {

  return (

    <div
      className="
        rounded-[32px]
        border
        border-white/5
        bg-black/20
        p-8
        h-[320px]
        overflow-y-auto
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Live Transcript
      </h2>

      <p
        className="
          text-zinc-300
          leading-loose
          text-lg
        "
      >
        {
          transcript ||

          "Transcript will appear here..."
        }
      </p>

    </div>
  );
}

export default TranscriptPanel;