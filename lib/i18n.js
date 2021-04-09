const resourceFactory = require("@ui5/fs").resourceFactory;
const log = require("@ui5/logger").getLogger("builder:customtask:zipper");


module.exports = async function ({ workspace, dependencies, options }) {
    const isDebug = options && options.configuration && options.configuration.debug;
		
		isDebug && log.info( options.configuration );
		
    let allResources;
    try {
        allResources = await workspace.byGlob(['**/i18n*.properties', '!**/node_modules/**'])
    } catch (e) {
        log.error(`Couldn't read resources: ${e}`);
    }

    let simpleLangCodeMatch = { "de": ["de_DE"], "en": ["en_EN"] };
	
	if(options.configuration && options.configuration.languageVector){
		simpleLangCodeMatch = options.configuration.languageVector;
	}
	
    for (let resource of allResources) {
        isDebug && log.info(`Reading i18n.properties file: ${resource.getPath()} .`);

        //get language code from i18n
        let strFileName = resource.getPath().substr(resource.getPath().lastIndexOf("/") + 1); //filename
        let strLanguageCode = strFileName.replace("i18n_", "").replace(".properties", "");

        log.info(`Language Code ${strLanguageCode}.`);

        if (!strLanguageCode.length) {
            continue;
        }

        if (!simpleLangCodeMatch[strLanguageCode]) {
            continue;
        }
        for (let i = 0; i < simpleLangCodeMatch[strLanguageCode].length; i++) {
			let strCopyFileName = resource.getPath().substr(0, resource.getPath().lastIndexOf("/") + 1) +
                "i18n_" + simpleLangCodeMatch[strLanguageCode][i] + ".properties";

			let copyResource = await resource.clone();
            copyResource.setPath(strCopyFileName);
            log.info(`Adjust from ${strFileName} to ${strCopyFileName}.`);
            await workspace.write(copyResource);
        }
    }
};