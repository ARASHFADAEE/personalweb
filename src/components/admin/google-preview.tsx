export function GooglePreview({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  const displayUrl = url.replace(/^\//, "");
  return (
    <div className="rounded-lg border border-border bg-white p-4 dark:bg-[#1a1a1f]" dir="ltr">
      <div className="max-w-xl">
        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {`dev.net › ${displayUrl}`}
        </p>
        <h3 className="mt-1 text-xl leading-7 text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
          {title || "عنوان مقاله"}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
          {description || "توضیحات متا اینجا نمایش داده می‌شود."}
        </p>
      </div>
    </div>
  );
}
