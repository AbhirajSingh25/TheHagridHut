function GlowOrb() {

  return (

    <>

      <div
        className="
          fixed
          top-[-200px]
          right-[-150px]
          w-[700px]
          h-[700px]
          bg-red-600/10
          rounded-full
          blur-[180px]
          pointer-events-none
        "
      />


      <div
        className="
          fixed
          bottom-[-300px]
          left-[-200px]
          w-[800px]
          h-[800px]
          bg-cyan-500/5
          rounded-full
          blur-[220px]
          pointer-events-none
        "
      />


      <div
        className="
          fixed
          top-[40%]
          left-[30%]
          w-[500px]
          h-[500px]
          bg-red-500/5
          rounded-full
          blur-[180px]
          pointer-events-none
        "
      />

    </>
  );
}

export default GlowOrb;