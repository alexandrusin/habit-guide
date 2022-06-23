import { Client } from '@notionhq/client'
import { Habit, HabitPage } from '../types/schema.d'

export default class NotionService {
	client: Client

	constructor() {
		this.client = new Client({
			auth: process.env.NOTION_KEY,
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

	async getSingleHabit(slug: string) {
		if (!slug) {
			throw 'No slug'
		}

		const database = process.env.NOTION_DATABASE_ID ?? ''
		const response = await this.client.databases.query({
			database_id: database,
			filter: {
				property: 'Slug',
				formula: {
					string: {
						equals: slug,
					},
				},
			},
		})

		if (!response.results[0]) {
			throw 'No results'
		}

		let habit = NotionService.habitFormatter(response.results[0])

		return {
			habit,
		}
	}

	private static habitFormatter(notionPage: any): Habit {
		return {
			id: notionPage.id,
			slug: notionPage.properties.Slug.formula.string,
			name: notionPage.properties.Name.title[0].plain_text,
			description: notionPage.properties.Description.rich_text[0].plain_text,
			why: notionPage.properties.Why.rich_text[0].plain_text,
			difficulty: notionPage.properties.Difficulty.select.name,
		}
	}
}
