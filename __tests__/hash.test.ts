import { sha256 } from '../src/hash'

describe('sha256', () => {
  it('should return the correct sha256 hash of a message', async () => {
    const hash = await sha256('hello world')

    expect(hash).toBe(
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    )
  })
})
