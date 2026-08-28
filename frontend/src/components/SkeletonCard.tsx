function SkeletonCard() {

  return (

    <div
      className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        animate-pulse
      "
    >

      <div
        className="
          h-8
          w-48
          bg-white/10
          rounded-xl
          mb-6
        "
      />

      <div
        className="
          h-5
          w-full
          bg-white/10
          rounded-lg
          mb-4
        "
      />

      <div
        className="
          h-5
          w-5/6
          bg-white/10
          rounded-lg
          mb-4
        "
      />

      <div
        className="
          h-5
          w-2/3
          bg-white/10
          rounded-lg
        "
      />

    </div>
  );
}

export default SkeletonCard;