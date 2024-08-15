import { StorageFile } from '@unserved/module-storage'
import { Metadata, transformerDate } from '@unserved/server'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Article } from './Article'
import { ArticleCategory } from './ArticleCategory'

/**
 * A blog post is a post that can be published on the website. It is used to
 * share information with the visitors of the website such as the news, the
 * events, the tutorials, and the articles. The blog post can be customized
 * with a title, a description, a cover image, and a content.
 */
@Entity({ name: 'ArticleContent' })
export class ArticleContent extends Metadata {

  /**
   * A reference to the blog post entity.
   */
  @JoinColumn()
  @ManyToOne(() => Article, Article => Article.content)
  post: Article

  /**
   * Title of the post. It is used to display the post in the frontend.
   *
   * @example 'How to create a blog with TypeScript and Node.js'
   */
  @Column('string')
  name: string

  /**
   * Slug of the post. It is auto-generated from the name and is used to create a
   * URL-friendly version of the post. The slug is used to fetch the post from the frontend.
   * The slug is unique across all the posts of the website.
   *
   * @example 'how-to-create-a-blog-with-typescript-and-node-js'
   */
  @Column('string', { unique: true })
  slug: string

  /**
   * A short description of the post. It allows to summarize the content of the post in a few words
   * and provide better SEO optimization for the post.
   */
  @Column('text')
  description: string

  /**
   * Markdown content of the post. The content is converted to HTML before being displayed in the frontend.
   *
   * @example 'This is a **markdown** content.'
   */
  @Column('text')
  content: string

  /**
   * The date at which the entity is published.
   */
  @Column('varchar', { transformer: transformerDate, length: 255, nullable: true })
  publishedAt?: Date

  /**
   * A cover image of the post. It is used to display the post in the frontend and provide a visual
   * representation of the post.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true })
  image: StorageFile

  /**
   * The category of the post. It allows to group the posts by category in the frontend.
   */
  @JoinColumn()
  @ManyToOne(() => ArticleCategory, category => category.posts)
  categories: ArticleCategory
}
