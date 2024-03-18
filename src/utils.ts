import { parse as SvgParser } from 'svg-parser';
import type { ChildrenData,Providers } from "./types"

export default new class utils {
    svgParser = SvgParser

    /** Get svg content from given svg name */
    async getSvg(svgName:string,provider:Providers){
        const urlName = this.compUrl(svgName,provider)
        const svgUrl = (
            provider==="google" ? `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${urlName}/default/24px.svg` :
            provider==="lucide" ? `https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${urlName}.svg` :
            provider==="bootstrap" ? `https://icons.getbootstrap.com/assets/icons/${urlName}.svg` :
            provider==="fontawesome" ? `https://site-assets.fontawesome.com/releases/v6.5.1/svgs/solid/${urlName}.svg` :
            `https://icons.getbootstrap.com/assets/icons/${urlName}.svg`
        )
        const request = await fetch(svgUrl)
        // if svg was not founded, return null
        if(request.status!==200) return null
        // else get svg content
        const svgText = (await request.text())
                        // replace class and any comments
                        .replace(/(class)="[^"]+"/g, '').replace(/ >/g,">").replace(/<!--[\s\S]*?-->/ig,'')
        return svgText
    }

    /** Handle svg's children */
    svgChildren(children:ChildrenData){
        const propertiesMap = Object.entries(children.properties).map(data=>{
            const name = data[0]
            const value = ["width","height"].includes(data[0]) ? "100%" : data[1]
            return `${name}="${value}"`
        })
        return (
            children.tagName==="svg" ? `<${children.tagName} ${propertiesMap.join(" ")}>\n` :
            `    <${children.tagName} ${propertiesMap.join(" ")} />\n`
        )
    }

    /** Convert svg text to JSX */
    toJsx(svg:string){
        svg = svg.replace(/-(\w)/g, (match,p1)=>p1.toUpperCase())
              .replace('<svg','    <svg')
              .replace('</svg>','    </svg>')
              .replace(/<path/g,'    <path')
              .replace(/<circle/g,'    <circle')
        return `export default function(){\n${svg}\n}`
    }

    /** Turn text into component url */
    compUrl(name:string,provider:Providers){
        const compUrl = (
            provider==="google" ? name.trim().toLowerCase().replace(/ /g,"_") :
            name.trim().toLowerCase().replace(/ /g,"-")
        )
        return compUrl
    }

    /** Turn text into component name */
    compName(name:string){
        name = name.trim().replace(/ /g,"").replace(/-(\w)/g, (match,p1)=>p1.toUpperCase())
        return name.charAt(0).toUpperCase()+name.slice(1)
    }

    wait(time:number=1000){
        return new Promise(r=>setTimeout(r,time))
    }
}