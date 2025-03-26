import { useState, useEffect, useRef } from "react";

const SearchSelect = ({
  customId = "",
  options,
  placeholder = "Selecciona una opcion",
  defaultValue,
  fields,
  variant = "FILTER",
  onChange,
}) => {
  const [search, setSearch] = useState(defaultValue || "");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const variants = {
    FILTER: {
      inputClasses: `filter-input w-full sm:min-w-[400px]`,
      dropdownClasses: `absolute filter-input overflow-y-auto rounded shadow-lg z-50 h-auto max-h-[220px] bg-slate-50`,
    },
    INPUT: {
      inputClasses: `form-input`,
      dropdownClasses: `absolute filter-input overflow-y-auto rounded shadow-lg z-50 h-auto max-h-[220px] bg-slate-50 w-full`,
    },
  };

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) => {
        let targetText =
          option[fields.key]?.toLowerCase() +
          " " +
          option[fields.value]?.toLowerCase();
        return targetText.includes(search?.toLowerCase());
      })
    );
  }, [search, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setSearch(option[fields.value]);
    setIsOpen(false);
  };

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        id={customId}
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClick={() => setIsOpen(true)}
        placeholder={selected ? selected.label : placeholder}
        className={variants[variant].inputClasses}
      />
      {isOpen && (
        <ul className={variants[variant].dropdownClasses}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option[fields.key]}
                onClick={() => handleSelect(option)}
                className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
              >
                {option[fields.key] + " - " + option[fields.value]}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchSelect;

// Ejemplo de uso
// const App = () => {
//   const options = [
//     { value: "apple", label: "Apple" },
//     { value: "banana", label: "Banana" },
//     { value: "orange", label: "Orange" },
//   ];

//   return (
//     <div className="p-4">
//       <h2 className="mb-2 text-lg font-semibold">Custom Select with Search</h2>
//       <CustomSelect options={options} />
//     </div>
//   );
// };

// export default App;
