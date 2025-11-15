import { Maybe } from './utils'

export interface BaseAuthData {
  validUntil: number
}

export type TAuthorizationData<T> = {
  initialData: T
  createCallback: () => Promise<Maybe<T>>
}

export class AuthorizationData<T extends BaseAuthData> {
  private validUntil: number
  private authorizationData: T
  private createCallback: () => Promise<Maybe<T>>
  constructor({ initialData, createCallback }: TAuthorizationData<T>) {
    this.authorizationData = initialData
    this.validUntil = initialData.validUntil
    this.createCallback = createCallback
  }

  /**
   * Checks if the authorization data is still valid
   * @returns True if the data is valid, false otherwise
   */
  public isValid(): boolean {
    return Math.round(Date.now() / 100) < this.validUntil
  }

  /**
   * Checks if the authorization data is close to expiration
   * @returns True if the data is close to expiration, false otherwise
   */
  public isCloseToExpire(): boolean {
    const currentTime = Date.now() / 100
    const timeToExpire = this.validUntil - 60 * 5
    return currentTime > timeToExpire
  }

  /**
   * Creates new authorization data by calling the createCallback function
   */
  public createNew(): void {
    this.createCallback().then((data) => {
      if (!data) return
      this.authorizationData = data
      this.validUntil = data.validUntil
    })
  }

  /**
   * Gets the authorization data, creating new data if it is close to expiration
   * @returns The authorization data
   */
  public getAuthorizationData(): T {
    if (!this.isCloseToExpire()) {
      this.createCallback()
    }
    return this.authorizationData
  }
}
