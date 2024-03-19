#! /usr/bin/env node
import fs from "fs"
import path from "path"
import * as clack from "@clack/prompts"
import utils from "./utils.js"
import type { Config } from "./types"

// Show package path
if(process.argv.find(data=>data.includes("--dev"))) clack.log.info(path.dirname(new URL(import.meta.url).pathname))

/** Script CONFIG @type {{[key:string]:any}} */
const CONFIG:Config = { iconsPath:"src/icons", iconProvider:"lucide", framework:"svg",svgName:"" }

// Welcome
clack.intro("Welcome to iconsX")

// Where should we save icons to |||||||||||||||||||||
async function selectIconsPath(){
    // @ts-ignore
    CONFIG['iconsPath'] = await clack.text({ message:"Enter path to save icons, example: src/icons",defaultValue:"src/icons" })
    // If user cancel script
    if(clack.isCancel(CONFIG['iconsPath'])){ clack.cancel("Icons path was not provided") ; process.exit(1) }
    // create folder if it does exists
    if(!fs.existsSync(CONFIG['iconsPath'])){
        clack.log.success(`Icons directory created at: ${CONFIG['iconsPath']}`)
        fs.mkdirSync(CONFIG['iconsPath'],{ recursive: true })
    }
    CONFIG['iconsPath'] = CONFIG['iconsPath'].endsWith("/") ? CONFIG['iconsPath'] : `${CONFIG['iconsPath']}/`
}


// Select icon provider |||||||||||||||||||||
async function selectProvider(){
    // @ts-ignore
    CONFIG['iconProvider'] = await clack.select({
        message:"Select icons provider",
        options: [
            { label: "Lucide icons",value:"lucide" },
            { label: "Google icons",value:"google" },
            { label: "BootStrap icons",value:"bootstrap" },
            { label: "Font Awesome",value:"fontawesome" },
        ],
    })
    // If user cancel script
    if(clack.isCancel(CONFIG['iconProvider'])){ clack.cancel("Icon provider was not provided") ; process.exit(1) }
}

// Select framework |||||||||||||||||||||
async function selectFramework(){
    // @ts-ignore
    CONFIG['framework'] = await clack.select({
        message:"Choose framework",
        options: [
            { label: "Plain svg",value:"svg" },
            { label: "svelte",value:"svelte" },
            { label: "JSX",value:"jsx" },
        ],
    })
    // If user cancel script
    if(clack.isCancel(CONFIG['framework'])){ clack.cancel("Framework was not provided") ; process.exit(1) }
}

// Select svg name |||||||||||||||||||||
async function selectSvgName(){
    // @ts-ignore
    CONFIG['svgName'] = await clack.text({ message:"What is the svg's name ?"})
    // If user cancel script
    if(clack.isCancel(CONFIG['svgName']) || !CONFIG['svgName']){ clack.cancel("Script was canceled") ; process.exit(1) }
}



/** Make changes after saving icon */
async function makeChanges(){
    const action = await clack.select({
        message:"What would you like to",
        options: [
            { label: "Keep downloading icons",value:"continue" },
            { label: "Change svg provider",value:"changeProvider" },
            { label: "Change framework",value:"changeFramework" },
            { label: "Stop script",value:"stop" },
        ],
    })
    // If user cancel script
    if(clack.isCancel(action)){ clack.cancel("Script stopped") ; process.exit(1) }
    // change framework
    if(action==="changeProvider") await selectProvider()
    else if(action==="changeFramework") await selectFramework()
    else if(action==="stop") { clack.cancel("Script stopped") ; process.exit(1) }
}

await selectIconsPath()
await selectProvider()
await selectFramework()


// Run code
while(true){
    await selectSvgName()
    const spinner = clack.spinner()
    const svgTextRes = await utils.getSvg(CONFIG.svgName,CONFIG.iconProvider)
    spinner.start(`Checking svg:${CONFIG.svgName} was founded`) // start spinner
    await utils.wait()
    // if svg was not founded, skip loop and ask for icon name again
    if(!svgTextRes){
        clack.log.error(`Svg with name:${CONFIG.svgName} was not founded in ${CONFIG.iconProvider} directory.`)
        continue
    }
    // run code
    spinner.stop(`Svg:${CONFIG.svgName} was founded`) // stop spinner
    const parsedSvg = utils.svgParser(svgTextRes) as any
    let svgText:string = utils.svgChildren(parsedSvg.children[0])
    // loop all svg's children
    for(const children of parsedSvg.children[0].children){
        svgText += utils.svgChildren(children)
    }
    svgText += "</svg>"
    // save icons
    const svgPath = CONFIG.iconsPath+utils.compName(CONFIG.svgName)+(CONFIG.framework==="jsx" ? ".tsx" : CONFIG.framework==="svelte" ? ".svelte" : ".svg")
    fs.writeFileSync(svgPath,CONFIG.framework==="jsx" ? utils.toJsx(svgText) : svgText)
    clack.log.success(`Svg saved to: ${svgPath}`)
    // Ask for changes
    await makeChanges()
}