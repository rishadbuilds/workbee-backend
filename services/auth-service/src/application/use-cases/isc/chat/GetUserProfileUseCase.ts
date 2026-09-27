import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IGetUserProfileUseCase, IUserProfile } from '../../../ports/isc/IGetUserProfileUseCase';
import { ErrorMessages } from '../../../../shared/constants/ErrorMessages';
import { UserMapper } from '../../../mappers/UserMapper';

/**
 * inter service communication to get user details to communication service chat
 */

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase{
  constructor(
    @inject("UserRepository") private readonly _userRepository: IUserRepository
  ) {}

  async execute(userId: string):Promise<IUserProfile> {
    
    const user = await this._userRepository.findById(userId);

    if (!user) {  
      throw new Error(ErrorMessages.USER.NOT_FOUND);
    }

    return UserMapper.toUserProfile(user);
  }
}
