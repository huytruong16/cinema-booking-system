import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockFilmService = {
  getAllFilms: jest.fn(),
  getAllFilmFormats: jest.fn(),
  getFilmById: jest.fn(),
  getFilmReviews: jest.fn(),
  createFilm: jest.fn(),
  updateFilm: jest.fn(),
  removeFilm: jest.fn(),
  createFilmVersion: jest.fn(),
  updateFilmVersion: jest.fn(),
  removeFilmVersion: jest.fn(),
};

describe('FilmController', () => {
  let controller: FilmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmController],
      providers: [
        {
          provide: FilmService,
          useValue: mockFilmService,
        },
      ],
    }).compile();

    controller = module.get<FilmController>(FilmController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllFilms -> gọi service', async () => {
    mockFilmService.getAllFilms.mockResolvedValue({ data: [] });
    const result = await controller.getAllFilms({});

    expect(mockFilmService.getAllFilms).toHaveBeenCalledWith({});
    expect(result).toEqual({ data: [] });
  });

  it('getAllFilmFormats -> gọi service', async () => {
    mockFilmService.getAllFilmFormats.mockResolvedValue({ data: [] });
    const result = await controller.getAllFilmFormats({});

    expect(mockFilmService.getAllFilmFormats).toHaveBeenCalled();
    expect(result).toEqual({ data: [] });
  });

  it('getById -> throw nếu id không phải UUID', async () => {
    await expect(controller.getById('123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('getById -> throw NotFound nếu không có phim', async () => {
    mockFilmService.getFilmById.mockResolvedValue(null);

    await expect(
      controller.getById('550e8400-e29b-41d4-a716-446655440000'),
    ).rejects.toThrow(NotFoundException);
  });

  it('getById -> trả phim nếu tồn tại', async () => {
    const film = { MaPhim: 'id' };
    mockFilmService.getFilmById.mockResolvedValue(film);

    const result = await controller.getById(
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(result).toEqual(film);
  });

  it('createFilm -> gọi service với file', async () => {
    const dto: any = { TenGoc: 'Test' };
    const poster = { originalname: 'poster.png' } as any;
    const backdrop = { originalname: 'backdrop.png' } as any;

    mockFilmService.createFilm.mockResolvedValue({ message: 'ok' });

    const result = await controller.createFilm(dto, {
      posterFile: [poster],
      backdropFile: [backdrop],
    });

    expect(mockFilmService.createFilm).toHaveBeenCalledWith(
      dto,
      poster,
      backdrop,
    );
    expect(result).toEqual({ message: 'ok' });
  });

  it('updateFilm -> throw nếu id không hợp lệ', async () => {
    await expect(controller.updateFilm('abc', {}, {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateFilm -> gọi service', async () => {
    mockFilmService.updateFilm.mockResolvedValue({ message: 'updated' });

    const result = await controller.updateFilm(
      '550e8400-e29b-41d4-a716-446655440000',
      {},
      {},
    );

    expect(mockFilmService.updateFilm).toHaveBeenCalled();
    expect(result).toEqual({ message: 'updated' });
  });

  it('removeFilm -> throw nếu id không hợp lệ', async () => {
    await expect(controller.removeFilm('123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('removeFilm -> gọi service', async () => {
    mockFilmService.removeFilm.mockResolvedValue({ message: 'deleted' });

    const result = await controller.removeFilm(
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(mockFilmService.removeFilm).toHaveBeenCalled();
    expect(result).toEqual({ message: 'deleted' });
  });

  it('createFilmVersion -> gọi service', async () => {
    mockFilmService.createFilmVersion.mockResolvedValue({ message: 'ok' });

    const result = await controller.create({} as any);

    expect(mockFilmService.createFilmVersion).toHaveBeenCalled();
    expect(result).toEqual({ message: 'ok' });
  });

  it('updateFilmVersion -> throw nếu id sai', async () => {
    await expect(controller.update('abc', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('removeFilmVersion -> gọi service', async () => {
    mockFilmService.removeFilmVersion.mockResolvedValue({ message: 'ok' });

    const result = await controller.remove(
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(mockFilmService.removeFilmVersion).toHaveBeenCalled();
    expect(result).toEqual({ message: 'ok' });
  });
});
