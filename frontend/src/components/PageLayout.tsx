function PageLayout({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {

  return (
    <div className="p-8">

      <div className="flex items-start justify-between gap-6 flex-wrap">

        <div>

          <h1 className="text-4xl font-bold text-white tracking-tight">

            {title}

          </h1>

          {subtitle && (

            <p className="text-gray-400 mt-3 text-lg leading-7 max-w-2xl">

              {subtitle}

            </p>

          )}

        </div>

        {action && (

          <div>

            {action}

          </div>

        )}

      </div>

      <div className="mt-10">

        {children}

      </div>

    </div>
  );
}

export default PageLayout;