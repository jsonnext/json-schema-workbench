"use client"

import { CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { useState, useRef, useCallback, type KeyboardEvent, ReactNode, ReactElement, JSXElementConstructor } from "react"

import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export type Option = {
  label: string
  value: string
}

type AutoCompleteProps<T> = {
  options: (Option & T)[]
  emptyMessage: string
  value?: Option & T
  onValueChange?: (value: Option & T) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  Results?: JSXElementConstructor<{ selected?: boolean, option: Option & T }>
}

export const AutoComplete = <T = {}>({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  Results
}: AutoCompleteProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState<Option | undefined>(value)
  const [inputValue, setInputValue] = useState<string>(value?.label || "")

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) {
        return
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true)
      }
      if(event.key === "Backspace" && input && input.value.length === (input.selectionEnd ?? 0 - (input?.selectionStart || 0))) {
        setSelected(undefined)
      }

      if(selected && input.value === "") {
        setSelected(undefined)

      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        if(input.value !== "") {
          const optionToSelect = options.find((option) => option.label === input.value)
          if (optionToSelect) {
            setSelected(optionToSelect)
            onValueChange?.(optionToSelect)
          }
        }
      }

      if (event.key === "Escape") {
        input.blur()
      }
    },
    [isOpen, options, onValueChange]
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
    if(selected) {
      setInputValue(selected?.label)
    }
  }, [selected])

  const handleSelectOption = useCallback(
    (selectedOption: Option & T) => {
      setInputValue(selectedOption.label)

      setSelected(selectedOption)
      onValueChange?.(selectedOption)

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange]
  )

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-base"
          role="combobox"
          aria-haspopup="listbox"
        />
      </div>
      <div className="relative mt-1">
        {isOpen ? (
          <div className="ease-in-outorigin-top-left absolute top-0 z-10 w-full rounded-xl bg-stone-50 outline-none transition duration-150 animate-in fade-in-0 zoom-in-95 dark:bg-slate-800">
            <CommandList className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
              {isLoading ? (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-12  w-full" />
                  </div>
                </CommandPrimitive.Loading>
              ) : null}
              {options.length > 0 && !isLoading ? (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected?.value === option.value
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn("flex w-full items-center gap-2", !isSelected ? "pl-8" : null)}
                
                      >
                        {isSelected ? <Check className="w-4" /> : null}
                        {Results ? <Results option={option} /> : option.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                  {emptyMessage}
                </CommandPrimitive.Empty>
              ) : null}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  )
}
