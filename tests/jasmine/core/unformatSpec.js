describe('unformat()', function(){

    // Money::Currency.all primary symbols that contain "." (PIO #31271).
    var MONEY_GEM_DOTTED_SYMBOLS = [
        'د.ت', 'د.إ', 'ر.ع.', 'B/.', 'ر.ق', 'ر.س', 'Bs.F', 'kr.',
        'د.ج', 'ج.م', 'դր.', 'лв.', 'ب.د', 'Bs.', 'Nu.', 'د.ك',
        'ل.ل', 'ل.د', 'د.م.', 'ع.د', 'د.ا'
    ];

    // PIO Money::SUPPORTED_CURRENCIES subset whose Money gem symbol contains "."
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

    it('should remove padding special chars', function(){
        expect( accounting.unformat('$ 123,456') ).toBe( 123456 );
        expect( accounting.unformat('$ 123,456.78') ).toBe( 123456.78 );
        expect( accounting.unformat('&*()$ 123,456') ).toBe( 123456 );
        expect( accounting.unformat(';$@#$%^&123,456.78') ).toBe( 123456.78 );
    });

    it('should work for negative numbers', function(){
        expect( accounting.unformat('$ -123,456') ).toBe( -123456 );
        expect( accounting.unformat('$ -123,456.78') ).toBe( -123456.78 );
        expect( accounting.unformat('&*()$ -123,456') ).toBe( -123456 );
        expect( accounting.unformat('&*()$(123,456)A$@P') ).toBe( -123456 );
        expect( accounting.unformat(';$@#$%^&-123,456.78') ).toBe( -123456.78 );
    });
    
    it('should accept different decimal separators', function(){    
        expect( accounting.unformat('$ 123,456', ',') ).toBe( 123.456 );
        expect( accounting.unformat('$ 123456|78', '|') ).toBe( 123456.78 );
        expect( accounting.unformat('&*()$ 123>456', '>') ).toBe( 123.456 );
        expect( accounting.unformat(';$@#$%^&123,456\'78', '\'') ).toBe( 123456.78 );
    });

    it('should accept an array', function(){
        var vals = accounting.unformat(['$ 123', '$567.89', 'R$12,345,678.901']);
        expect( vals[0] ).toBe( 123 );
        expect( vals[1] ).toBe( 567.89 );
        expect( vals[2] ).toBe( 12345678.901 );
    });

    it('should strip Money gem currency symbols that contain a period', function(){
        for (var i = 0; i < MONEY_GEM_DOTTED_SYMBOLS.length; i++) {
            expect( accounting.unformat(MONEY_GEM_DOTTED_SYMBOLS[i] + '12.00') ).toBe( 12 );
        }
    });

    it('should parse PIO supported currencies with dotted symbols (#31271)', function(){
        for (var i = 0; i < PIO_SUPPORTED_DOTTED_SYMBOLS.length; i++) {
            var symbol = PIO_SUPPORTED_DOTTED_SYMBOLS[i].symbol;
            expect( accounting.unformat(symbol + '12.00') ).toBe( 12 );
            expect( accounting.unformat(symbol + '1,000.00') ).toBe( 1000 );
        }
    });

    it('should not treat symbol periods as decimals for SAR (regression #31271)', function(){
        expect( accounting.unformat('ر.س12.00') ).toBe( 12 );
        expect( accounting.unformat('ر.س12.00') ).not.toBe( 0.12 );
        expect( accounting.unformat('ر.س1,000.00') ).toBe( 1000 );
        expect( accounting.unformat('-ر.س12.50') ).toBe( -12.5 );
    });

    it('should handle dotted symbols with trailing period before digits (OMR, MAD, kr.)', function(){
        expect( accounting.unformat('ر.ع.12.00') ).toBe( 12 );
        expect( accounting.unformat('د.م.1,234.56') ).toBe( 1234.56 );
        expect( accounting.unformat('kr.12.00') ).toBe( 12 );
        expect( accounting.unformat('kr.12.00') ).not.toBe( 0.12 );
    });

    it('should handle slash-adjacent symbol periods (PAB B/.)', function(){
        expect( accounting.unformat('B/.12.00') ).toBe( 12 );
        expect( accounting.unformat('B/.1,000.00') ).toBe( 1000 );
    });

    it('should handle Latin dotted symbols (Bs., Bs.F, Nu., лв., դր.)', function(){
        expect( accounting.unformat('Bs.12.00') ).toBe( 12 );
        expect( accounting.unformat('Bs.F12.00') ).toBe( 12 );
        expect( accounting.unformat('Nu.12.00') ).toBe( 12 );
        expect( accounting.unformat('лв.12.00') ).toBe( 12 );
        expect( accounting.unformat('դր.12.00') ).toBe( 12 );
    });

    it('should still parse symbols without periods unchanged', function(){
        expect( accounting.unformat('$12.50') ).toBe( 12.5 );
        expect( accounting.unformat('€1,234.56') ).toBe( 1234.56 );
        expect( accounting.unformat('£99.00') ).toBe( 99 );
        expect( accounting.unformat('₱50.00') ).toBe( 50 );
        expect( accounting.unformat('₹1,000.00') ).toBe( 1000 );
    });

    it('should drop symbol periods when decimal separator is not "."', function(){
        expect( accounting.unformat('ر.س1.234,56', ',') ).toBe( 1234.56 );
        expect( accounting.unformat('kr.1.234,56', ',') ).toBe( 1234.56 );
    });

    it('should keep real decimals, leading decimals, and treat bad input as 0', function(){
        expect( accounting.unformat('$12.50') ).toBe( 12.5 );
        expect( accounting.unformat('.50') ).toBe( 0.5 );
        expect( accounting.unformat('-.50') ).toBe( -0.5 );
        expect( accounting.unformat(12.5) ).toBe( 12.5 );
        expect( accounting.unformat(undefined) ).toBe( 0 );
        expect( accounting.unformat(null) ).toBe( 0 );
        expect( accounting.unformat('abc') ).toBe( 0 );
    });

});
