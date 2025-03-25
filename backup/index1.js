import jsonfile from "jsonfile"
import json from "./data-backup.json" with { type: "json" };

json.instances.forEach(tei=>{
    const foundDataValue = tei.enrollments[0].events[0].dataValues.find(dv=> dv.dataElement === "jDSCfb245G5")
    if(foundDataValue){
        
        const orgUnit =foundDataValue.value
        tei.orgUnit = orgUnit
        tei.enrollments[0].orgUnit = orgUnit
        tei.enrollments[0].events.forEach(event=>{
            event.orgUnit = orgUnit
        })
    }
})

jsonfile.writeFileSync("./payload.json", json)