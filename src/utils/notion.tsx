import { Client } from '@notionhq/client'
import { Habit } from '../types/schema.d'

export default class NotionService {
	client: Client

	constructor() {
		this.client = new Client({
			auth: process.env.NOTION_TOKEN,
		})
	}

	// TODO: read about promises in typescript
	async getHabits(): Promise<Habit[]> {
		const database = process.env.NOTION_DATABASE_ID ?? ''
		// ?? nullish coalescing operator returns left side if it's not null or undefined
		// (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing-operator)

		// list all habits in the database
		const response = await this.client.databases.query({
			database_id: database,
			filter: {
				property: 'Published',
				checkbox: {
					equals: true,
				},
			},
		})

		return response.results.map((res) => {
			return NotionService.habitFormatter(res)
		})
	}

	private static habitFormatter(notionPage: any): Habit {
		return {
			id: notionPage.id,
			slug: notionPage.properties.Slug.rich_text[0].plain_text,
			name: notionPage.properties.Name.title[0].plain_text,
			description: notionPage.properties.Description.rich_text[0].plain_text,
			why: notionPage.properties.Why.rich_text[0].plain_text,
			difficulty: notionPage.properties.Difficulty.select.name,
			tags: notionPage.properties.Tags.relation,
		}
	}
}
