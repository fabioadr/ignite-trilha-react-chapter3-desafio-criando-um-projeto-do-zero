import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination
  const [nextPage, setNextPage] = useState(next_page)
  const [posts, setPosts] = useState<Post[]>(results)

  const loadPosts = async () => {
    const postsResponse = await fetch(nextPage)

    const json = await postsResponse.json()
    const post = json.results[0]

    setNextPage(json.next_page)
    setPosts([
      ...posts,
      {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    ])
  }

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <img src="/images/logo.svg" alt="logo" />

        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <time><FiCalendar />{format(
                  new Date(post.first_publication_date),
                  "dd MMM yyyy",
                  {
                    locale: ptBR,
                  }
                )}</time>
                <span><FiUser />{post.data.author}</span>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && <button onClick={loadPosts}>Carregar mais posts</button>}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    // fetch: ['post.uid', 'post.title', 'post.subtitle', 'post.author'],
    pageSize: 1
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
