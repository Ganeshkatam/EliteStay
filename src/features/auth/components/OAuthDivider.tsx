export function OAuthDivider({
  text = 'or continue with email',
}: {
  text?: string;
}) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-sm font-medium leading-6">
        <span className="bg-white px-6 text-slate-900">{text}</span>
      </div>
    </div>
  );
}
