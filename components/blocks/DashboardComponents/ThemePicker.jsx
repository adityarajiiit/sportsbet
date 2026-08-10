
export default function ThemePicker({ themes, activeTheme, onSelectTheme }) {
  return (
    <div className="p-4 bg-base-100 h-full w-full border border-base-content/10 rounded-xl absolute -bottom-10 inset-x-0 mx-auto mb-20">
      <h1 className="text-2xl font-poppins font-bold uppercase">
        Select <span className="text-warning">Themes</span>
      </h1>
      <p className="text-sm font-inter text-gray-300 w-4/6">
        Personalize your experience by choosing a theme that matches your style.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-6">
        {themes.map((t, index) => (
          <button
            className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeTheme == t ? "bg-base-200" : "hover:bg-base-200"
            }`}
            key={index}
            onClick={() => onSelectTheme(t)}
          >
            <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
              <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                <div className="rounded bg-primary"></div>
                <div className="rounded bg-secondary"></div>
                <div className="rounded bg-accent"></div>
                <div className="rounded bg-neutral"></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}