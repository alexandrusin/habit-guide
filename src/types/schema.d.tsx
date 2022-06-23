export type Tag = {
	color: string
	id: string
	name: string
}

export type Habit = {
	id: string
	slug: string
	name: string
	description: string
	why: string
	difficulty: string
	// tags: Tag[]
}
