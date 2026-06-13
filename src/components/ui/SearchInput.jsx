import { Search } from "lucide-react";

export default function SearchInput({ placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-inset border border-border-default text-sm text-white rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all placeholder:text-neutral-500"
      />
    </div>
  );
}
