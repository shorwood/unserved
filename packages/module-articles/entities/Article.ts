import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { Metadata } from '@unserved/server'
import { ArticleContent } from './ArticleContent'

/**
 * A blog post is a post that can be published on the website. It is used to
 * share information with the visitors of the website such as the news, the
 * events, the tutorials, and the articles. The blog post can be customized
 * with a title, a description, a cover image, and a content.
 */
@Entity({ name: 'Article' })
export class Article extends Metadata {

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
   * A cover image of the post. It is used to display the post in the frontend and provide a visual
   * representation of the post.
   */
  @JoinColumn()
  @OneToMany(() => ArticleContent, content => content.post)
    content: ArticleContent[]
}
