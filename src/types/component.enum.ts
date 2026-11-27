export const Component = {
  Application: Symbol.for('Application'),

  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),

  DatabaseClient: Symbol.for('DatabaseClient'),

  UserModel: Symbol.for('UserModel'),
  UserService: Symbol.for('UserService'),

  OfferModel: Symbol.for('OfferModel'),
  OfferService: Symbol.for('OfferService'),

  CommentModel: Symbol.for('CommentModel'),
  CommentService: Symbol.for('CommentService'),

  UserController: Symbol.for('UserController'),
  OfferController: Symbol.for('OfferController'),

  ExceptionFilter: Symbol.for('ExceptionFilter'),

  ImportCommand: Symbol.for('ImportCommand'),

  CommentController: Symbol.for('CommentController'),
} as const;
