import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

describe('root redirect', () => {
	it('redirects / to /daily-check', () => {
		try {
			load();
			expect.fail('Expected redirect to be thrown');
		} catch (error) {
			expect(error).toMatchObject({
				status: 307,
				location: '/daily-check'
			});
		}
	});
});
