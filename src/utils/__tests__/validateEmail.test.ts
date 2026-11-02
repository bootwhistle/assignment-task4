import { validateEmail } from '../index';

describe('validateEmail', () => {
    describe('accepts valid addresses', () => {
        it.each([
            ['3-letter domain ending', 'eva.young@example.com'],
            ['2-letter country domain (seed user)', 'luigi@carluccio.it'],
            ['multi-part country domain (seed user)', 'john@silva.com.br'],
            ['Canadian domain', 'someone@bowvalleycollege.ca'],
            ['4-letter domain ending', 'x@site.info'],
            ['long domain ending', 'volunteer@calgary.community'],
            ['subdomain', 'staff@mail.example.org'],
            ['dot and dash in the name', 'bob.last-name@gmail.com'],
            ['dash in the domain', 'luigi@carluccio-family.it'],
            ['digits in the name', 'user123@example.co'],
        ])('%s: %s', (_scenario, email) => {
            expect(validateEmail(email)).toBe(true);
        });

        it('ignores capitals and surrounding spaces', () => {
            expect(validateEmail('  Luigi@Carluccio.IT ')).toBe(true);
        });
    });

    describe('rejects invalid addresses', () => {
        it.each([
            ['empty string', ''],
            ['no @', 'luigi.carluccio.it'],
            ['no domain ending', 'luigi@carluccio'],
            ['1-letter domain ending', 'luigi@carluccio.i'],
            ['nothing before @', '@carluccio.it'],
            ['two @ signs', 'luigi@@carluccio.it'],
            ['space inside', 'luigi carluccio@example.com'],
            ['ends with a dot', 'luigi@carluccio.it.'],
            ['double dot in the domain', 'luigi@carluccio..it'],
        ])('%s: "%s"', (_scenario, email) => {
            expect(validateEmail(email)).toBe(false);
        });
    });
});
