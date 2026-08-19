describe('formatMoney()', function(){

    var MONEY_GEM_DOTTED_SYMBOLS = [
        'د.ت', 'د.إ', 'ر.ع.', 'B/.', 'ر.ق', 'ر.س', 'Bs.F', 'kr.',
        'د.ج', 'ج.م', 'դր.', 'лв.', 'ب.د', 'Bs.', 'Nu.', 'د.ك',
        'ل.ل', 'ل.د', 'د.م.', 'ع.د', 'د.ا'
    ];

    var PIO_SUPPORTED_DOTTED_SYMBOLS = [
        { iso: 'SAR', symbol: 'ر.س' },
        { iso: 'AED', symbol: 'د.إ' },
        { iso: 'BHD', symbol: 'ب.د' },
        { iso: 'JOD', symbol: 'د.ا' },
        { iso: 'EGP', symbol: 'ج.م' },
        { iso: 'MAD', symbol: 'د.م.' },
        { iso: 'TND', symbol: 'د.ت' },
        { iso: 'DKK', symbol: 'kr.' },
        { iso: 'BGN', symbol: 'лв.' },
        { iso: 'BOB', symbol: 'Bs.' }
    ];

    it('should work for small numbers', function(){

        expect( accounting.formatMoney(123) ).toBe( '$123.00' );
        expect( accounting.formatMoney(123.45) ).toBe( '$123.45' );
        expect( accounting.formatMoney(12345.67) ).toBe( '$12,345.67' );

    });

    it('should work for negative numbers', function(){

        expect( accounting.formatMoney(-123) ).toBe( '$-123.00' );
        expect( accounting.formatMoney(-123.45) ).toBe( '$-123.45' );
        expect( accounting.formatMoney(-12345.67) ).toBe( '$-12,345.67' );

    });

    it('should allow precision to be `0` and not override with default `2`', function(){
        expect( accounting.formatMoney(5318008, "$", 0) ).toBe( '$5,318,008' );
    });

    it('should not treat a period in the currency symbol as a decimal (SAR #31271)', function(){
        expect( accounting.formatMoney('ر.س12.00', 'ر.س', 2) ).toBe( 'ر.س12.00' );
        expect( accounting.formatMoney(12, 'ر.س', 2) ).toBe( 'ر.س12.00' );
        expect( accounting.formatMoney('ر.س1,000.00', 'ر.س', 2) ).toBe( 'ر.س1,000.00' );
        expect( accounting.formatMoney(-12, 'ر.س', 2) ).toBe( 'ر.س-12.00' );
    });

    it('should round-trip formatted strings for all Money gem dotted symbols', function(){
        for (var i = 0; i < MONEY_GEM_DOTTED_SYMBOLS.length; i++) {
            var symbol = MONEY_GEM_DOTTED_SYMBOLS[i];
            expect( accounting.formatMoney(symbol + '12.00', symbol, 2) ).toBe( symbol + '12.00' );
            expect( accounting.formatMoney(12, symbol, 2) ).toBe( symbol + '12.00' );
        }
    });

    it('should round-trip PIO supported dotted currencies', function(){
        for (var i = 0; i < PIO_SUPPORTED_DOTTED_SYMBOLS.length; i++) {
            var symbol = PIO_SUPPORTED_DOTTED_SYMBOLS[i].symbol;
            expect( accounting.formatMoney(symbol + '1,000.00', symbol, 2) ).toBe( symbol + '1,000.00' );
            expect( accounting.formatMoney(1000, symbol, 2) ).toBe( symbol + '1,000.00' );
        }
    });

    it('should not corrupt kr., B/. and OMR-style trailing-period symbols', function(){
        expect( accounting.formatMoney('kr.12.00', 'kr.', 2) ).toBe( 'kr.12.00' );
        expect( accounting.formatMoney('B/.12.00', 'B/.', 2) ).toBe( 'B/.12.00' );
        expect( accounting.formatMoney('ر.ع.12.00', 'ر.ع.', 2) ).toBe( 'ر.ع.12.00' );
        expect( accounting.formatMoney('د.م.1,234.56', 'د.م.', 2) ).toBe( 'د.م.1,234.56' );
    });

});
