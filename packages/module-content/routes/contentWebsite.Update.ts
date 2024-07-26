import { IsNull, Not } from 'typeorm'
import { assertNil, assertString, assertStringEmail, assertStringEmpty, assertStringUuid, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '@unserve/module-storage'
import { assertContactSocials } from '../utils'
import { ModuleContent } from '../index'

export function contentUpdate(this: ModuleContent) {
  return createRoute(
    {
      name: 'PUT /api/website',
      body: createParser({
        url: [[assertNil], [assertString]],
        name: [[assertNil], [assertString]],
        description: [[assertNil], [assertString]],
        contactPhone: [[assertNil], [assertString]],
        contactEmail: [[assertNil], [assertStringEmail], [assertStringEmpty]],
        contactAddress: [[assertNil], [assertString]],
        taxType: [[assertNil], [assertString]],
        taxNumber: [[assertNil], [assertString]],
        registrationNumber: [[assertNil], [assertString]],
        contactSocials: [[assertNil], [assertContactSocials]],
        iconId: [[assertNil], [assertStringUuid]],
        imageId: [[assertNil], [assertStringUuid]],
        bannerId: [[assertNil], [assertStringUuid]],
      }),
    },

    async({ event, body }) => {
      const assetModule = this.getModule(ModuleStorage)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.WEBSITE_UPDATE.id] })

      // --- Fetch the latest website entity.
      const { ContentWebsite } = this.entities
      const website = await ContentWebsite.findOne({
        where: { createdAt: Not(IsNull()) },
        order: { updatedAt: 'DESC' },
        relations: {
          icon: true,
          image: true,
          banner: true,
        },
      })

      // --- If the website entity is not found, throw an error.
      if (!website) throw this.errors.CONTENT_WEBSITE_NOT_FOUND()

      // --- Duplicate the website entity.
      if (body.name) website.name = body.name
      if (body.url) website.url = body.url
      if (body.description) website.description = body.description
      if (body.contactEmail) website.contactEmail = body.contactEmail
      if (body.contactPhone) website.contactPhone = body.contactPhone
      if (body.contactAddress) website.contactAddress = body.contactAddress
      if (body.taxType) website.taxType = body.taxType
      if (body.taxNumber) website.taxNumber = body.taxNumber
      if (body.registrationNumber) website.registrationNumber = body.registrationNumber
      if (body.contactSocials) website.contactSocials = body.contactSocials
      if (body.iconId !== undefined) website.icon = await assetModule.resolveFile(body.iconId)
      if (body.imageId !== undefined) website.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId !== undefined) website.banner = await assetModule.resolveFile(body.bannerId)

      // --- Save the website entity.
      await website.save()
      return website.serialize(this)
    },
  )
}
