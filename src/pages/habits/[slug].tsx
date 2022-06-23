import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import Logo from '../../components/Logo'
import NotionService from '../../utils/notion'

const Habit = ({ habit }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<div className="wrapper">
			<Link href="/">
				<a>
					<Logo animate="true" />
				</a>
			</Link>

			<h2>{habit.name}</h2>
		</div>
	)
}

export const getStaticProps: GetStaticProps = async (context) => {
	const notionService = new NotionService()
	const data = await notionService.getSingleHabit(
		context.params?.slug as string
	)

	if (!data) {
		throw 'Not Found'
	}

	return {
		props: {
			habit: data.habit,
		},
	}
}

export async function getStaticPaths() {
	const notionService = new NotionService()
	const habits = await notionService.getHabits()

	const paths = habits.map((habit) => {
		return `/habits/${habit.slug}`
	})

	return {
		paths,
		fallback: false,
	}
}

export default Habit
