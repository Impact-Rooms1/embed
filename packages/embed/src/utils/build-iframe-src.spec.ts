import { buildIframeSrc } from './build-iframe-src'

Object.defineProperty(window.document, 'title', { value: 'page title' })

describe('build-iframe-src', () => {
  describe('#buildIframeSrc', () => {
    it('should return iframe src', () => {
      expect(buildIframeSrc({ formId: 'some-id', type: 'widget', embedId: '', options: {} })).toMatch(
        'https://form.typeform.com/to/some-id'
      )
    })

    describe('when formID is just an ID', () => {
      it('should include default url options', () => {
        expect(buildIframeSrc({ formId: 'some-id', type: 'widget', embedId: 'embed-id', options: {} })).toBe(
          'https://form.typeform.com/to/some-id' +
            '?typeform-embed-id=embed-id' +
            '&typeform-embed=embed-widget' +
            '&typeform-source=localhost' +
            '&typeform-medium=embed-sdk' +
            '&typeform-medium-version=next'
        )
      })
    })

    describe('when formID is a URL', () => {
      it('should include the full URL', () => {
        const formId = 'https://custom.example.com/form-id'
        const iframeSrcParams =
          '?typeform-embed-id=embed-id' +
          '&typeform-embed=embed-widget' +
          '&typeform-source=localhost' +
          '&typeform-medium=embed-sdk' +
          '&typeform-medium-version=next'
        expect(buildIframeSrc({ formId, type: 'widget', embedId: 'embed-id', options: {} })).toBe(
          `${formId}${iframeSrcParams}`
        )
      })
    })

    describe('when passing custom domain', () => {
      it('should prefer it over the default one', () => {
        const iframeSrcParams =
          '?typeform-embed-id=embed-id' +
          '&typeform-embed=embed-widget' +
          '&typeform-source=localhost' +
          '&typeform-medium=embed-sdk' +
          '&typeform-medium-version=next'
        expect(
          buildIframeSrc({
            formId: 'formId',
            type: 'widget',
            domain: 'custom.example.com',
            embedId: 'embed-id',
            options: {},
          })
        ).toBe(`https://custom.example.com/to/formId${iframeSrcParams}`)
      })

      it('should ignore the domain if formID is URL', () => {
        const formId = 'https://custom.example.com/form-id'
        const iframeSrcParams =
          '?typeform-embed-id=embed-id' +
          '&typeform-embed=embed-widget' +
          '&typeform-source=localhost' +
          '&typeform-medium=embed-sdk' +
          '&typeform-medium-version=next'
        expect(
          buildIframeSrc({ formId, type: 'widget', domain: 'foobar.example.net', embedId: 'embed-id', options: {} })
        ).toBe(`${formId}${iframeSrcParams}`)
      })
    })

    it('should override default url options if value is explicitly supplied', () => {
      const src = buildIframeSrc({
        formId: 'some-id',
        type: 'widget',
        embedId: 'id',
        options: { medium: 'unit-test-medium', source: 'unit-test-source' },
      })
      expect(src).toMatch('typeform-medium=unit-test-medium')
      expect(src).toMatch('typeform-source=unit-test-source')
    })

    it('should omit false url options', () => {
      const src = buildIframeSrc({
        formId: 'some-id',
        type: 'widget',
        embedId: '',
        options: { hideFooter: true, hideHeaders: false },
      })
      expect(src).toMatch('embed-hide-footer=true')
      expect(src).not.toMatch('embed-hide-headers')
    })

    it('should include all url options', () => {
      const options = {
        source: 'unit-test-source',
        medium: 'unit-test-medium',
        mediumVersion: 'unit-test-version',
        hideFooter: true,
        hideHeaders: true,
        opacity: 50,
        disableTracking: true,
        hidden: {
          foo: 'foo value',
          bar: '@bar&value?',
        },
        enableSandbox: true,
        tracking: {
          utm_foo: 'utm foo value',
          foobar: 'foobar&value',
        },
        hubspot: true,
        autoResize: true,
        onEndingButtonClick: () => {},
      }
      expect(buildIframeSrc({ formId: 'some-id', type: 'widget', embedId: 'embed-id', options })).toBe(
        'https://form.typeform.com/to/some-id' +
          '?typeform-embed-id=embed-id' +
          '&typeform-embed=embed-widget' +
          '&typeform-source=unit-test-source' +
          '&typeform-medium=unit-test-medium' +
          '&typeform-medium-version=unit-test-version' +
          '&embed-hide-footer=true' +
          '&embed-hide-headers=true' +
          '&embed-opacity=50' +
          '&disable-tracking=true' +
          '&__dangerous-disable-submissions=true' +
          '&typeform-embed-auto-resize=true' +
          '&typeform-embed-handle-ending-button-click=true' +
          '&utm_foo=utm+foo+value&foobar=foobar%26value' +
          '#foo=foo+value&bar=%40bar%26value%3F' +
          '&hubspot_page_name=page+title&hubspot_page_url=http%3A%2F%2Flocalhost%2F'
      )
    })

    it('should disable tracking and submission on sandbox mode', () => {
      const options = {
        source: 'unit-test-source',
        medium: 'unit-test-medium',
        mediumVersion: 'unit-test-version',
        enableSandbox: true,
      }

      expect(buildIframeSrc({ formId: 'some-id', type: 'widget', embedId: 'embed-id', options })).toBe(
        'https://form.typeform.com/to/some-id' +
          '?typeform-embed-id=embed-id' +
          '&typeform-embed=embed-widget' +
          '&typeform-source=unit-test-source' +
          '&typeform-medium=unit-test-medium' +
          '&typeform-medium-version=unit-test-version' +
          '&disable-tracking=true' +
          '&__dangerous-disable-submissions=true'
      )
    })

    it('should disable H1 headings in form if H1 is present in host page', () => {
      jest.spyOn(document, 'querySelectorAll').mockReturnValue({ length: 1 } as NodeListOf<Element>)
      expect(buildIframeSrc({ formId: 'some-id', type: 'widget', embedId: '', options: {} })).toMatch(
        'typeform-embed-no-heading=true'
      )
    })
  })
})
