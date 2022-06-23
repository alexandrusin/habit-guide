import type { NextPage } from 'next'
import NotionService from '../utils/notion'
import Logo from '../components/Logo'

import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { Habit } from '../types/schema.d'
import Link from 'next/link'

const Home: NextPage = ({
	habits,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<div className="wrapper">
			<Link href="/">
				<a>
					<Logo animate="true" />
				</a>
			</Link>

			<div className="habits">
				{habits.map((habit: Habit) => {
					console.log('habits from index', habit)
					return (
						<Link href={`/habits/${habit.slug}`} key={habit.id}>
							<a>
								<div className="habit">
									<h3>{habit.name}</h3>
									<ul>
										<li>{habit.description}</li>
										<li>{habit.why}</li>
										<li>{habit.difficulty}</li>
									</ul>
									<hr />
								</div>
							</a>
						</Link>
					)
				})}
			</div>
		</div>
	)
}

export const getStaticProps: GetStaticProps = async (context) => {
	const notionService = new NotionService()
	const habits = await notionService.getHabits()

	return {
		props: {
			habits,
		},
	}
}

export default Home
