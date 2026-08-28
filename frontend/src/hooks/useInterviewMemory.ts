import {
  useState,
} from "react";


function useInterviewMemory() {

  const [

    memory,

    setMemory,

  ] = useState<string[]>([]);


  function addMemory(
    item: string
  ) {

    setMemory((prev) => [

      ...prev,

      item,
    ]);
  }


  function clearMemory() {

    setMemory([]);
  }


  return {

    memory,

    addMemory,

    clearMemory,
  };
}

export default useInterviewMemory;