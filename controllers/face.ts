import { Body, Controller, Post, Route, Tags, Res, TsoaResponse } from 'tsoa'
import { ServiceResponse } from '../utils/serviceResponse'
import db from '../models'

type FaceVerifyRequest = {
  apiKey?: string
  faceImageBase64?: string
  department?: string
}

type FaceVerifyResult = {
  matched: boolean
  entityType?: 'employee' | 'visitor' | 'unknown'
  userId?: string
  fullName?: string
  department?: string
  profilePhoto?: string
}

type FaceVerifyError = {
  matched: false
  error?: string
}

@Route('api/faces')
@Tags('Faces')
export class FaceController extends Controller {
  // Stub implementation to wire FE -> BE.
  // NOTE: Replace with real face embedding matching later.
  @Post('/verify')
  public async verifyFace(
    @Body() request: FaceVerifyRequest,
    @Res() res: TsoaResponse<200 | 400, ServiceResponse<FaceVerifyResult | FaceVerifyError>>,
  ): Promise<void> {
    const { apiKey, faceImageBase64, department } = request

    // API key gate (kiosk)
    if (apiKey !== '103745a027eb8c7f8efd7b765abce7f2207de2e182819d97b06ab7ef457380fc') {
      res(400, ServiceResponse.failure('Invalid apiKey', { matched: false, error: 'Invalid apiKey' }, 400))
      return
    }

    if (!faceImageBase64 || !faceImageBase64.trim()) {
      res(400, ServiceResponse.failure('faceImageBase64 is required', { matched: false, error: 'faceImageBase64 is required' }, 400))
      return
    }

    // Strip dataURL prefix if any
    const normalized = faceImageBase64.replace(/^data:image\/\w+;base64,/, '')

    // 1) Try matching against stored user.face
    const user = await db.User.findOne({
      where: {
        ...(department ? { department } : {}),
        face: normalized,
      },
    })

    if (user) {
      res(
        200,
        ServiceResponse.success('Face matched', {
          matched: true,
          entityType: 'employee',
          userId: user.id,
          fullName: user.fullName,
          department: user.department,
          profilePhoto: user.profilePicture,
        }),
      )
      return
    }

    // 2) Try matching against stored visitors.profilePhoto
    const visitor = await db.Visitor.findOne({
      where: {
        ...(department ? { department } : {}),
        profilePhoto: normalized,
      },
    })

    if (visitor) {
      res(
        200,
        ServiceResponse.success('Face matched', {
          matched: true,
          entityType: 'visitor',
          userId: visitor.id,
          fullName: visitor.fullName,
          department: visitor.department,
          profilePhoto: visitor.profilePhoto,
        }),
      )
      return
    }

    res(
      200,
      ServiceResponse.success('No match', {
        matched: false,
      }),
    )
  }
}


