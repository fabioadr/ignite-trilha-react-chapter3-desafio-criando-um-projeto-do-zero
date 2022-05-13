import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // console.log(post.data.content)
  const router = useRouter()

  if (router.isFallback) {
    return <strong>Carregando...</strong>
  }

  const content = post.data.content.map((content) => {
    return `<h2>${content.heading}</h2>${RichText.asHtml(content.body)}`
  }).join('')

  return (
    <>
      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} />
      </div>

      <main className={styles.container}>
        <div className={styles.postHeader}>
          <h1>{post.data.title}</h1>
          <time><FiCalendar />{format(
            new Date(post.first_publication_date),
            "dd MMM yyyy",
            {
              locale: ptBR,
            }
          )}</time>
          <span><FiUser />{post.data.author}</span>
          <span><FiClock />4 min</span>
        </div>

        <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: content }} />
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', {});

  return {
    paths: [
      {
        params: {
          slug: 'como-utilizar-hooks',
        }
      },
      {
        params: {
          slug: 'criando-um-app-cra-do-zero',
        }
      }
    ],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('post', String(slug), {
    // fetch: ['post.uid', 'post.title', 'post.subtitle', 'post.banner', 'post.author', 'post.content']
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  }

  return {
    props: { post }
  }
};
