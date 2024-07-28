import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Metadata } from '@unserved/server'
import { StorageFile } from '@unserved/module-storage'
import { Article } from './Article'

/**
 * A `ArticleCategory` entity corresponds to a classification of the blog posts
 * of the website. It is used to organize the blog posts in categories such as
 * the news, the events, the tutorials, and the articles. The blog category can
 * be customized with a name, a description, and a cover image.
 */
@Entity({ name: 'ArticleCategory' })
export class ArticleCategory extends Metadata {

  /**
   * Title of the category. It is used to display the category in the frontend.
   *
   * @example 'News'
   */
  @Column('string')
    name: string

  /**
   * The slug of the category. It is auto-generated from the name and is used to
   * create a URL-friendly version of the category. The slug is used to fetch the
   * category from the frontend.
   */
  @Column('string', { unique: true })
    slug: string

  /**
   * A short description of the category. It allows to summarize the content of the category in a few words
   * and provide better SEO optimization for the category.
   */
  @Column('text')
    description: string

  /**
   * A cover image of the category. It is used to display the category in the frontend and provide a visual
   * representation of the category.
   */
  @ManyToOne(() => StorageFile, { nullable: true })
    image: StorageFile

  /**
   * A reference to the posts of the category. It is used to fetch the posts of the category from the frontend.
   */
  @OneToMany(() => Article, post => post.content)
    posts: Article[]
}
