import {
  useEffect,
  useState,
} from "react";


function useInterviewTimer(

  active: boolean
) {

  const [
    seconds,
    setSeconds,
  ] = useState(0);


  useEffect(() => {

    if (!active) {

      return;
    }

    const interval =
      setInterval(() => {

        setSeconds(
          (prev) =>
            prev + 1
        );

      }, 1000);


    return () =>
      clearInterval(interval);

  }, [active]);


  function formatTime() {

    const hrs =
      Math.floor(
        seconds / 3600
      );

    const mins =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      seconds % 60;


    return [

      hrs
        .toString()
        .padStart(2, "0"),

      mins
        .toString()
        .padStart(2, "0"),

      secs
        .toString()
        .padStart(2, "0"),

    ].join(":");
  }


  return {

    seconds,

    formattedTime:
      formatTime(),
  };
}

export default useInterviewTimer;