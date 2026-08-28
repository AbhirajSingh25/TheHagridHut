function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div
      className="
        w-full
        max-w-[1600px]
        mx-auto
        pb-10
      "
    >

      {children}

    </div>
  );
}

export default PageContainer;