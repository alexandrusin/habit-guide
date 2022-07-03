import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Habit } from '../types/schema.d'

export default class NotionService {
	notion: Client
	n2m: NotionToMarkdown

	constructor() {
		this.notion = new Client({
			auth: process.env.NOTION_KEY,
		})
		this.n2m = new NotionToMarkdown({
			notionClient: this.notion,
		})
	}

	// TODO: read about promises in typescript
	async getHabits(): Promise<Habit[]> {
		const database = process.env.NOTION_DATABASE_ID ?? ''
		// ?? nullish coalescing operator returns left side if it's not null or undefined
		// (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing-operator)

		// list all habits in the database
		const response = await this.notion.databases.query({
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
		const response = await this.notion.databases.query({
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

		// const post = await this.notion.pages.retrieve({
		// 	page_id: response.results[0].id,
		// })

		const page = response.results[0]
		const blocks = await this.n2m.pageToMarkdown(page.id)

		console.log('HELLO DATA > ', blocks)

		if (!page) {
			throw 'No results'
		}

		let habit = NotionService.habitFormatter(page)
		let markdown = this.n2m.toMarkdownString(blocks)

		return {
			habit,
			markdown,
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
