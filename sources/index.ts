import * as TsMorph from 'ts-morph'

export class StackTracer {
  private Code: string

  constructor(Code: string) {
    this.Code = Code
  }

  Analyze(): string {
    const ProjectInstance = new TsMorph.Project({
      compilerOptions: {
        allowJs: true,
        skipLibCheck: true,
        target: TsMorph.ScriptTarget.ES2020
      },
      skipFileDependencyResolution: true,
      useInMemoryFileSystem: true
    })
    const FileInstance = ProjectInstance.createSourceFile('code.js', this.Code, { overwrite: true })
    let TryStatements = FileInstance.getDescendantsOfKind(TsMorph.SyntaxKind.TryStatement)
    TryStatements = TryStatements.filter(TryStatement => {
      const CatchClauseStat = TryStatement.getFirstDescendantByKind(TsMorph.SyntaxKind.CatchClause)?.getFullText()
      return typeof CatchClauseStat !== 'undefined' && (CatchClauseStat.includes('location') || CatchClauseStat.includes('href'))
    })
    const Target = TryStatements[0].getFirstAncestorByKind(TsMorph.SyntaxKind.FunctionDeclaration)
    return Target.getFirstChildByKind(TsMorph.SyntaxKind.Identifier).getText()
  }
}