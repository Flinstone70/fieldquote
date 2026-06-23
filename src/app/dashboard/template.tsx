export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-enter flex flex-1 flex-col">{children}</div>;
}
