import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const colorThemes = [
  {
    name: "Purple",
    value: "purple",
    primary: "262 83% 58%",
    ring: "262 83% 58%",
    accentForeground: "262 83% 70%",
    noteActive: "262 83% 15%",
    sidebarPrimary: "224.3 76.3% 48%",
  },
  {
    name: "Blue",
    value: "blue", 
    primary: "217 91% 60%",
    ring: "217 91% 60%",
    accentForeground: "217 91% 70%",
    noteActive: "217 91% 15%",
    sidebarPrimary: "217 91% 48%",
  },
  {
    name: "Green",
    value: "green",
    primary: "142 71% 45%",
    ring: "142 71% 45%",
    accentForeground: "142 71% 55%",
    noteActive: "142 71% 15%",
    sidebarPrimary: "142 71% 35%",
  },
  {
    name: "Orange",
    value: "orange",
    primary: "25 95% 53%",
    ring: "25 95% 53%",
    accentForeground: "25 95% 63%",
    noteActive: "25 95% 15%",
    sidebarPrimary: "25 95% 43%",
  },
  {
    name: "Pink",
    value: "pink",
    primary: "330 81% 60%",
    ring: "330 81% 60%",
    accentForeground: "330 81% 70%",
    noteActive: "330 81% 15%",
    sidebarPrimary: "330 81% 48%",
  },
];

export function ColorThemeChanger() {
  const { theme } = useTheme();
  
  const applyColorTheme = (colorTheme: typeof colorThemes[0]) => {
    const root = document.documentElement;
    
    // Apply to both light and dark mode
    root.style.setProperty('--primary', colorTheme.primary);
    root.style.setProperty('--ring', colorTheme.ring);
    root.style.setProperty('--accent-foreground', colorTheme.accentForeground);
    root.style.setProperty('--note-active', colorTheme.noteActive);
    
    // Apply sidebar primary for dark mode
    if (theme === 'dark') {
      root.style.setProperty('--sidebar-primary', colorTheme.sidebarPrimary);
    }
    
    // Store the current theme in localStorage
    localStorage.setItem('color-theme', colorTheme.value);
  };

  // Apply saved theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme) {
      const theme = colorThemes.find(t => t.value === savedTheme);
      if (theme) {
        applyColorTheme(theme);
      }
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Change color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {colorThemes.map((colorTheme) => (
          <DropdownMenuItem
            key={colorTheme.value}
            onClick={() => applyColorTheme(colorTheme)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: `hsl(${colorTheme.primary})` }}
              />
              {colorTheme.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}