import { Dict } from "@types"

export const dictEs: Dict = {
	common: {
		restricted: "Este es un comando restringido, no puedes usarlo",
	},
	help: {
		desc: "Proporciona ayuda sobre los comandos",
		usage: "muestra la ayuda de [command]",
		notFound: "Este comando no existe",
	},
	clear: {
		usage: "Borra todo excepto el historial",
	},
	hello: {
		usage: "Muestra `Hello world`",
		usageArgs: "Muestra `Hello [text]`",
		world: "Hola mundo",
	},
	flowers: {
		usage: "🌼🌼🌼 Planta flores 🌼🌼🌼",
	},
	animation: {
		on: "Activa las animaciones",
		off: "Desactiva las animaciones",
		enabled: "activado",
		disabled: "desactivado",
	},
	lang: {
		fr: "Muestra todos los textos en francés",
		en: "Muestra todos los textos en inglés",
		es: "Muestra todos los textos en español",
		set: "idioma: {lang}",
	},
	error: {
		unknown:
			"{name} no se reconoce como un comando interno, escribe `help` para ver la lista",
		args: "argumento(s) no reconocido(s)",
	},
}
