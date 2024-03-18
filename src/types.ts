export type ChildrenData = { type:string,tagName:string,properties:{[key:string]:any} }

export type Providers = "google" | "lucide" | "bootstrap" | "fontawesome"

export type Config = { iconsPath:string, iconProvider:Providers, framework:"jsx"|"svg",svgName:string }